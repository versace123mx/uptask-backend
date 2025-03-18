import bcrypt from 'bcrypt'

//hasea la contraseña
export const hasPassword = async (password:string) => {
    //hash Password
    const salt = await bcrypt.genSalt(10)
    return await bcrypt.hash(password,salt)
}

//compara la contraseña que viene del formulario y la que se tiene almacenada
export const checkPassword = async (enteredPassword:string, storedHash:string) => {
    return await bcrypt.compare(enteredPassword,storedHash)
}