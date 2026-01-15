import express from "express"
import { prometheusMiddleware } from "./middleware/prometheus_middleware";
import client from "prom-client";

const app = express();


app.use(prometheusMiddleware);
const PORT = 3000;


app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.get("/cpu", async (req, res) => {
    
    await setTimeout(()=>{
        console.log("Doing some CPU work...");
    },10000);
  
    return res.status(200).send("CPU work done!" );
  });
  

app.get("/user",(req,res)=>{
    const users = [];
    for(let i = 0; i < 10000; i++) {
        users.push({ id: i, name: `User${i}` });
    }
    res.status(200).json(users);
})

app.get("/metrics", async (req, res) => {
    const metric = await client.register.metrics();
    res.set("Content-Type", client.register.contentType);
    res.end(metric);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
