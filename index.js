const http = require("http")

const Todos = [{id: 1, text: "Todo One"},
                {id: 2, text: "Todo Two"},
                {id: 3, text: "Todo Three"},
]
const server = http.createServer((req, res) => {
    const { method,url } = req
    let body = []

    req.on("data", chunk =>{
        body.push(chunk)
    })
    .on("end", () =>{
        body = Buffer.concat(body).toString()
        let status = 404
        const response = {
            success: false,
            data: null,
            error: null
        }

        if(method === "GET" && url === "/todos"){
            status = 200
            response.success = true
            response.data = Todos
        }else if(method === "POST" && url === "/todos"){
            const { id, text } = JSON.parse(body)
            if(!id || !text){
                status = 400;
                response.error = "Please add id and text both"
            }else{
            Todos.push({ id, text })
            status = 201
            response.success = true
            response.data = Todos
            }
        }

        res.writeHead(status, {
            "Content-Type": "application/json",
            "X-Powered-By": "Node.js"
        })
        res.end(
            JSON.stringify(response)
            )
    })
})

const PORT = 8000

server.listen(PORT, () => console.log(`Server running on Port ${PORT}`))