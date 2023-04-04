import axios from '../api/create'
import nav from '../../utils/nav'
import { useEffect, useState } from 'react'
import userContext from '../hooks/useContext'
import { FaInfoCircle, FaTimes, FaCheck } from 'react-icons/fa'

interface IAccountSetup {
    verifyEmail?: string,
}

const AccountSetup = ({ verifyEmail } : IAccountSetup) => {
    const {
        userRef, ToastContainer,
        userFocus, setUserFocus,
        vCode, setVCode, userId,
        requestOtp, USER_REGEX,
        showToastMessage,
    }: any = userContext()

    const [user, setUser] = useState<string>('')
    const [validName, setValidName] = useState<boolean>(false)

    useEffect(() => {
        userRef.current?.focus()
        showToastMessage("success", "Successful.");
        showToastMessage("warning", "You need to verify your email.");
        (async ():Promise<void> => await requestOtp(verifyEmail))()
    }, [])

    useEffect(() => {
        // validate user
        const resUser: boolean = USER_REGEX.test(user)
        setValidName(resUser)
    }, [vCode, user])

    const isValid: boolean = Boolean(validName) && Boolean(vCode)

    const handleSubmit = async (): Promise<void> => {
        await axios.post(
            '/account/setup',
            JSON.stringify({ username: user, verifyEmail: userId, vCode }),
            {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            }
        ).then((res: any) => {
            if (res?.data?.success) {
                setVCode("")
                showToastMessage("success", "Account setup successfully")
                setTimeout(() => {
                    nav({})
                    return
                }, 2000);
            }
        }).catch((err: any) => {
            showToastMessage("error", err.response?.data?.message)
        })
    }

    return (
        <>
            <ToastContainer />
            <h3 className="section-h3">Account Setup</h3>
            <form className="form" method="POST"
            onSubmit={e => e.preventDefault()}>
                <article className="form-center">
                    <div className="form-group">
                        <article className="validity-container">
                            <label htmlFor='username'>
                                set your username:
                            </label>
                            <div>
                                <FaCheck className={validName ? 'valid': 'hidden'} />
                                <FaTimes className={validName || !user ? 'hidden': 'invalid'} />
                            </div>
                        </article>
                        <input type="text" id="username"
                        placeholder='abc1'
                        autoComplete="off" value={user}
                        onChange={e => setUser(e.target.value)}
                        onBlur={() => setUserFocus(false)}
                        onFocus={() => setUserFocus(true)}
                        aria-invalid={validName ? "false" : "true"}
                        aria-describedby="uidnote" max={23} />
                        <article
                        className={userFocus && user && !validName ? 'constraint': 'hidden'}>
                            <FaInfoCircle />
                            <p id="uidnote">
                                3 to 23 characters. <br />
                                Must begin with a letter. <br />
                                Only hyphens, underscores are allowed.
                            </p>
                        </article>
                    </div>
                    <div className="form-group">
                        <article className="validity-container">
                            <label htmlFor='vcode'>
                                verify your email:
                            </label>
                        </article>
                        <input type="text" id="vcode" autoComplete="off"
                        placeholder='OTP sent to your mail.'
                        value={vCode} max={6}
                        onChange={e => setVCode(e.target.value)} />
                        <div className="reqOtp-container">
                        <button className="reqOtp-btn"
                        onClick={async () => await requestOtp(verifyEmail)}>
                            Resend
                        </button>
                        </div>
                    </div>
                </article>
                <div className="btn-container">
                    <button type="submit" className='btn'
                    disabled={!isValid} onClick={async () => await handleSubmit()}>
                        Finish
                    </button>
                </div>
            </form>
        </>
    )
}

export default AccountSetup