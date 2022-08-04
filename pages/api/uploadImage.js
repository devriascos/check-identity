export const config = {
  api: {
      bodyParser: {
          sizeLimit: '10mb' //Límite en peso de la imágen a 10MB
      }
  }
}

export default function handler(req, res) {
  if (req.method=='PUT') {    
    fetch(decodeURI(req.query.endPoint),{                      
      method: 'PUT',        
      body: req.body,
      headers: {          
        'Truora-API-Key': process.env.NEXT_PUBLIC_API_KEY,
        'Content-Type': 'image/jpeg; image/jpg; image/png'
      }
    })
    .then( ( response ) => response.json())
    .then( ( response ) => { 
      res.json(response)
    })
    .catch( (error) => res.json(error) ) 
  }
  
}
