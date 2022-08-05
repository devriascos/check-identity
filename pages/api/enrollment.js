import FormData from 'form-data'

export default function handler(req, res) {

  if (req.method=='POST') {     
  
    //Se preparan los datos requeridos para la creación del enrollment
    const formData = new FormData()
    formData.append('type', req.body.type)
    formData.append('user_authorized', req.body.user_authorized);
     
    //Envia la petición al endpoint de validaciones/enrollment
    fetch(`${process.env.NEXT_PUBLIC_VALIDATIONS_URL}/v1/enrollments`, {
      method: 'POST',
      headers: {
        'Truora-API-Key': process.env.NEXT_PUBLIC_API_KEY
      },
      body: formData
    })
    .then( response => response.json() )
    .then(response => { res.status(200).send(response) })
    .catch(error => { res.status(400).send(error) })
  }
  
}
