package main

import (
    "log"
    "math/rand"
    "net/http"
    "time"

    "github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
    CheckOrigin: func(r *http.Request) bool {
        return true
    },
}

type CandleData struct {
    Timestamp int64   `json:"x"` 
    Open      float64 `json:"o"`
    High      float64 `json:"h"`
    Low       float64 `json:"l"`
    Close     float64 `json:"c"`
    Volume    float64 `json:"volume"`
    Symbol    string  `json:"symbol"`
}

func generateRandomCandle(symbol string, lastClose float64) CandleData {
    movement := lastClose * 0.02

    direction := rand.Float64()*2 - 1 
    
    open := lastClose
    close := lastClose + (movement * direction)
    
    high := max(open, close) + (rand.Float64() * movement)
    low := min(open, close) - (rand.Float64() * movement)
    
    
    return CandleData{
        Timestamp: time.Now().Unix() * 1000, 
        Open:      float64(int(open*100)) / 100,
        High:      float64(int(high*100)) / 100,
        Low:       float64(int(low*100)) / 100,
        Close:     float64(int(close*100)) / 100,
        Volume:    float64(int(rand.Float64()*1000)) / 100,
        Symbol:    symbol,
    }
}

func max(a, b float64) float64 {
    if a > b {
        return a
    }
    return b
}

func min(a, b float64) float64 {
    if a < b {
        return a
    }
    return b
}

func handleWebSocket(w http.ResponseWriter, r *http.Request) {
    conn, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        log.Printf("Websocket upgrade failed: %v", err)
        return
    }
    defer conn.Close()

    lastClose := 100.0 
    symbol := "BTC/USD"

  
    for {
        candle := generateRandomCandle(symbol, lastClose)
        lastClose = candle.Close

        if err := conn.WriteJSON(candle); err != nil {
            log.Printf("Write failed: %v", err)
            break
        }

        time.Sleep(time.Second)
    }
}

func main() {
    rand.Seed(time.Now().UnixNano())

    http.HandleFunc("/ws", handleWebSocket)
    
    port := ":8080"
    log.Printf("Server starting on port %s", port)
    if err := http.ListenAndServe(port, nil); err != nil {
        log.Fatal("ListenAndServe:", err)
    }
}
