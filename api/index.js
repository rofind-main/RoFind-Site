export default function handler(req, res) {
    console.log("Hey you found me!")
    res.status(200).json({ message: "ok" })
}