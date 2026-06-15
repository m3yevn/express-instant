export function echoWebSocket(ws, req) {
  ws.send(JSON.stringify({ type: "connected", path: req.url }));

  ws.on("message", (data) => {
    ws.send(
      JSON.stringify({
        type: "echo",
        data: data.toString(),
        at: new Date().toISOString(),
      })
    );
  });
}
