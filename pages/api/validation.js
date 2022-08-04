export default function handler(req, res) {

  if (req.method=='POST') {         
    //Pepara los datos de la petición que viene desde el front
    const formData = new FormData();
    formData.append('account_id', req.body.account_id);
    formData.append('type', req.body.type);
    formData.append('country', req.body.country);
    formData.append('document_type', req.body.document_type);
    formData.append('user_authorized', req.body.user_authorized);     
    
    //Llama al endpoint de creación de una nueva validación
    fetch(`${process.env.NEXT_PUBLIC_VALIDATIONS_URL}/v1/validations`, {
      method: 'POST',
      headers: {
        'Truora-API-Key': process.env.NEXT_PUBLIC_API_KEY        
      },
      body: formData
    })
    .then( response => response.json() )
    .then(response => { res.status(200).json(response) })
    .catch(error => { res.status(400).json(error) })
  }

  //Para consultar el resultado de la validación
  if (req.method=='GET'){    
    //Envia la petición al endpoint de validaciones/enrollment    
    fetch(`${process.env.NEXT_PUBLIC_VALIDATIONS_URL}/v1/validations/${req.query.validationId}`,{
      method: 'GET',
      headers: {
        'Truora-API-Key': process.env.NEXT_PUBLIC_API_KEY
      }
    })
    .then( response => response.json() )
    .then(response => { res.status(200).send(response) })
    .catch(error => { res.status(400).send(error) })
  }
  
}
