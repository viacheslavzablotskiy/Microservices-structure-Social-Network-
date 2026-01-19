import type React from "react"
import './styleForAuth/secondPartOfPage.css'

export const AuthLayoutSide = () => {
    
    const navContent: React.ReactNode = 
    (<div className="auth-login-container">
        <div className="inner-container">
            <div className="just-text">
                <p>A WISE QOUTE</p>
                <p>______________________________</p>
            </div>
            <div className="cont">
                <div className="upper-case">
                    <p>Get</p>
                    <p>Everything</p>
                    <p>You Want</p>
                </div>
                <div className="lower-case">
                    <p>You can get everything you want if you work hard</p>
                    <p>trust the process, and stick to the plan.</p>
                </div>
            </div>
        </div>
    </div>)

    return navContent
}