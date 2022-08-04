import Head from 'next/head'
import {useState} from 'react'
import { useRouter } from 'next/router'
import styles from '../styles/Home.module.css'

import swal from 'sweetalert';


export default function Home() {


  const router = useRouter()

  //Inicializa los estados correspondientes a las imagenes del documento de identidad
  const [frontImage, setFrontImage] = useState('')
  const [reverseImage, setReverseImage] = useState('')
  const [frontImageUploaded, setFrontImageUploaded] = useState(false)
  const [reverseImageUploaded, setReverseImageUploaded] = useState(false)

  const [encodedImage, setEncodedImage] = useState('')
  const [isSending, setIsSending] = useState(false);

  //Se manejan los cambios (cargas de imagen en el input)
  //Para luego enviarlo en las peticiones al API
  const loadFrontImage = () => {
    const inputFrontImage = document.getElementById('front_image')
    inputFrontImage.click()
  }

  const loadReverseImage = () => {
    const inputReverseImage = document.getElementById('reverse_image')
    inputReverseImage.click()
  }

  //Setea las rutas de los ficheros en la caja de información
  const handleFrontImage = (imageInput) => {   
    //Set the image path
    setFrontImage(imageInput.target)
  }

  const handleReverseImage = (imageInput) => {   
    //Set the image path
    setReverseImage(imageInput.target)    
  }

  //Realiza el proce de validación mediante el API
  const startValidation = async () => {     
    //Si hay imagenes en el input de img. frontar y reverso
    if (frontImage.value && reverseImage.value) {

      const submitButton = document.querySelector('#submitButton')
      //submitButton.disabled = true
  
      //Cambia el texto por defecto del botón "Enviar"
      setIsSending(true)
      
      //Creamos el enrollment para obtener el accountID 
      //Para las demás peticiones
      const accountId = await fetch('api/enrollment',{
        method: 'POST',
        body: JSON.stringify({
          type: 'document-validation',
          user_authorized: 'true',
        }),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
      .then( response => response.json() )
      .then( (response) => { return response.account_id })
      .catch( (error) => console.log(error) )   
    
      //Si se creó el enrollment, crea la validación con el account_id      
      const validationDetails = await createValidation(accountId)         

      await uploadImageToServer('front', frontImage, validationDetails.front_image_endpoint)     
      await uploadImageToServer('reverse', reverseImage, validationDetails.reverse_image_endpoint)                  

      console.log('ValId: '+validationDetails.validation_id);
      setTimeout(()=>{
        //router.push(`/results?validationId=${validationDetails.validation_id}`)
      }, 3000)
    }
    else{
      swal('Por favor, selecciona las imágenes del documento')
    }
  }

  //Retorna el id de validación
  const createValidation = async (accountId) => {    
    //Creamos una nueva validación Nos debe retornar las url a las que se debe apuntar
    //La carga de las imágenes         
    const validationDetails = await fetch('api/validation',{
      method: 'POST',
      body: JSON.stringify({
        account_id: accountId,
        type: 'document-validation',
        country: 'CO',
        document_type: 'national-id',
        user_authorized: 'true'
      }),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    .then( response => response.json() )
    .then( (response) => { 
      return {
        validation_id: response.validation_id,
        front_image_endpoint: response.instructions.front_url,
        reverse_image_endpoint: response.instructions.reverse_url
      }
    })
    .catch( (error) => console.log(error) )    

    return validationDetails
  }

  const uploadImageToServer = async (imageSide, imageData, endPoint) => {      
    //Parseamos la url del endpoint para que no de conflictos
    const uploadImageEndPoint = encodeURIComponent(endPoint)      
    const reader = new FileReader()
    reader.onloadend = async () => {                
        await fetch(`api/uploadImage?endPoint=${uploadImageEndPoint}`,{                
          method: 'PUT',
          body: reader.result,//Manda los datos codificados de la imágen
          headers: {
            'Content-Type': imageData.files[0].type,
            'Accept': 'application/json'
          }
        })
        .then( ( response ) => response.json())
        .then( ( response ) => {
          console.log(response)
          imageSide == 'front' ? setFrontImageUploaded(true) : setReverseImageUploaded(true)    
          return response.http_code === 200 ? true : false 
        })
        .catch( (error) => console.log(error) ) 

      }
    reader.readAsDataURL(imageData.files[0]) 
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Identify</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Check Identity
        </h1>

        <p className={styles.description}>
          Verifica la identidad de tu cliente en segundos
        </p>

        <form className={styles.grid} id={'imagesForm'}>
          <div 
            className={styles.card}
            onClick={loadFrontImage}>
            <p>Cargar lado frontal de la cédula</p>
            <svg xmlns="http://www.w3.org/2000/svg" className={styles.iconMd} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg> 
            <p>{ frontImage.value ? `Seleccionaste ${frontImage.value}` : '' }</p>
            <input 
              type="file" 
              accept=".png, .jpg" 
              name="front_image" 
              id="front_image"
              className={styles.hidden}            
              onChange={handleFrontImage}/>
          </div>
          <div 
            className={styles.card}
            onClick={loadReverseImage}>
            <p>Cargar el reverso de la cédula</p>
            <svg xmlns="http://www.w3.org/2000/svg" className={styles.iconMd} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>            
            <p>{ reverseImage.value ? `Seleccionaste ${reverseImage.value}` : '' }</p>
            <input 
              type="file" 
              accept=".png, .jpg" 
              name="reverse_image" 
              id="reverse_image"
              className={styles.hidden}            
              onChange={handleReverseImage}/>
          </div>       
        </form>

        <button 
          className={styles.button} 
          onClick={startValidation}
          id={'submitButton'}>
          { isSending ? 'Procesando...' : 'Verificar identidad'}
        </button>        

      </main>

      <footer className={styles.footer}>
        <a
          href="https://tuasesor.digital"
          target="_blank"
          rel="noopener noreferrer"
        >
          With 💜 by Oscar Riascos
        </a>
      </footer>
    </div>
  )
}
