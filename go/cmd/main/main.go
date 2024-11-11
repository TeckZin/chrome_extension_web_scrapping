package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gorilla/websocket"
)

var count int

var upgrader = websocket.Upgrader{
	// Allow all origins for development
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func handleConnection(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Failed to upgrade connection: %v", err)
		return
	}
	defer conn.Close()

	log.Printf("New client connected")

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			log.Printf("Error reading message: %v", err)
			break
		}

		count++
		log.Printf("Received data: %s, count: %d", message, count)
		rgParts := strings.Split(string(message), ":")
		go addNewLine(rgParts[0], "g")
		go addNewLine(rgParts[1], "r")
		// Process the received CSV data here
	}
}

func addNewLine(message string, fileType string) {
	var filePath string

	// Get the current working directory
	currentDir, err := os.Getwd()
	if err != nil {
		return
	}

	// Construct the correct file path based on file type
	switch fileType {
	case "r":
		filePath = filepath.Join(currentDir, "internal", "file", "r.txt")
	case "g":
		filePath = filepath.Join(currentDir, "internal", "file", "g.txt")
	default:
		return
	}

	// Ensure directory exists
	dir := filepath.Dir(filePath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		fmt.Println("dir don't exists")
		return
	}

	// Open file with proper permissions
	file, err := os.OpenFile(filePath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		fmt.Println("cant open")
		return
	}
	defer file.Close()

	// Write message with newline
	if _, err := file.WriteString(message + "\n"); err != nil {
		fmt.Println("cant write")
		return
	}

}

func main() {
	http.HandleFunc("/", handleConnection)

	port := 6969
	fmt.Printf("WebSocket server starting on port %d...\n", port)
	if err := http.ListenAndServe(fmt.Sprintf(":%d", port), nil); err != nil {
		log.Fatal("ListenAndServe:", err)
	}
}
