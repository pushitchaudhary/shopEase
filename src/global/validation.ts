import validator from 'validator';

export function isValidEmail(value : string){

    const data = validator.isEmail(value)
    
   
}