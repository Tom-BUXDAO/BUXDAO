export default function handler(req, res) {
  console.log('Test API route hit');
  res.status(200).json({ 
    message: "API is working",
    method: req.method,
    url: req.url,
    headers: req.headers
  });
}
