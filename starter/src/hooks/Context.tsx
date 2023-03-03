import axios from '../api/create'
import { Link } from 'react-router-dom'
import React, { createContext, useContext, useRef, useState, useEffect, FormEvent } from 'react'

const Context: any | null = createContext({})

export const UserProvider: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const LOGIN_URL:string = "auth/login"
    const REGISTER_URL:string = "/auth/signup"
    const USER_REGEX:RegExp = /^[a-zA-Z][a-zA-Z0-9-_]{2,23}$/
    const PSWD_REGEX:RegExp = /^(?=(.*[a-z]){2,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\-__+.]){1,}).{5,89}$/

    const errRef = useRef<any>()
    const userRef = useRef<HTMLInputElement>()

    const [user, setUser] = useState<string>('')
    const [validName, setValidName] = useState<boolean>(false)
    const [userFocus, setUserFocus] = useState<boolean>(false)

    const [pswd, setPswd] = useState<string>('')
    const [validPswd, setValidPswd] = useState<boolean>(false)
    const [pswdFocus, setPswdFocus] = useState<boolean>(false)

    const [confirmPswd, setConfirmPswd] = useState<string>('')
    const [validConfirm, setValidConfirm] = useState<boolean>(false)
    const [confirmFocus, setConfirmFocus] = useState<boolean>(false)

    const [errMsg, setErrMsg] = useState<string | null>(null)
    const [success, setSuccess] = useState<boolean>(false)
    
    const [showPswd, setShowPswd] = useState<boolean>(false)
    const [showConfirmPswd, setShowConfirmPswd] = useState<boolean>(false)

    useEffect(() => {
        setErrMsg('')
    }, [user, pswd, confirmPswd])

    useEffect(() => {
        // validate user
        const resUser:boolean = USER_REGEX.test(user)
        setValidName(resUser)

        // validate password
        const resPswd:boolean = PSWD_REGEX.test(pswd)
        setValidPswd(resPswd)
        if (pswd) {
            const confirm:boolean = pswd === confirmPswd
            setValidConfirm(confirm)
        }
    }, [user, pswd, confirmPswd])

    useEffect(() => {
        userRef.current?.focus()
    }, [])

    useEffect(() => {
        setErrMsg("")
    }, [user, pswd])

    const isValid:boolean = validName && validPswd && validConfirm

    const handleSubmit = async (e: FormEvent<HTMLFormElement>):Promise<void> => {
        e.preventDefault()
        if (!isValid) {
            return setErrMsg('Warning! Invalid Entry.')
        }

        await axios.post(`${REGISTER_URL}`,
        JSON.stringify({ user, pswd }), {
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true
        })
        .then(_ => {
            setUser("")
            setPswd("")
            setConfirmPswd("")
            setSuccess(true)
        })
        .catch(err => {
            const statusCode = err.response.status
            if (statusCode === 409) {
                setErrMsg("User already exists.")
            } else if (statusCode === 400) {
                setErrMsg("Invalid credentials.")
            } else {
                setErrMsg("Server Error!")
            }
            setTimeout(() => {
                setErrMsg("")
            }, 3500);
        })
    }

    return (
        <Context.Provider value={{
            Link, errMsg, errRef, user, pswd,
            confirmPswd, userRef, setUserFocus,
            validName, userFocus, pswdFocus,
            setPswdFocus, validPswd, setUser,
            setPswd, setConfirmPswd, validConfirm,
            setConfirmFocus, showPswd, setShowPswd,
            confirmFocus, showConfirmPswd, handleSubmit,
            setShowConfirmPswd, isValid, success,
            LOGIN_URL
        }}>
            {children}
        </Context.Provider>
    )
}

const userContext: any = () => {
    const context:any = useContext(Context)
    if (context ===  undefined) {
        throw new Error("___");
    }
    return context
}

export default userContext