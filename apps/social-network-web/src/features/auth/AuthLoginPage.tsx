import { type LoginScemaUser } from "@repo/user-interfaces"
import {useForm, type SubmitHandler} from 'react-hook-form'
import { Link, useNavigate } from "react-router-dom"
import { useLoginInUserMutation } from "./endpointsAuth/endpoints"
import { useAppDispatch } from "../../main-app-settings/main-hooks"
import { setToken } from "../access-token/AccessToken"
import { loginInUser } from "./AuthSlice"
import './styleForAuth/LoginPage.css'
import logo from '../../upload_image/logo.png'
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import LockOpenIcon from '@mui/icons-material/LockOpen';

export const LoginPage  = () => {
    const {register, formState: {isValid, isSubmitting}, handleSubmit} = useForm<LoginScemaUser>({
        mode: 'onChange'
    })
    const [loginUserData] = useLoginInUserMutation()
    const dispatch = useAppDispatch()
    const navigate = useNavigate()

    const onSubmit: SubmitHandler<LoginScemaUser> = async (data) => {
        try {
            console.log('we begin login proccess');
            

            const response = await loginUserData(data).unwrap()
            
            dispatch(setToken(response.accessToken))
            dispatch(loginInUser(response.response))

            navigate('/home')
        } catch (error) {
            console.error('there is error at the LoginPage: ', error)
        }
    }

    return (
    <>
    <img src={logo} alt="just image" width={'100px'} height={'70px'}/>
    <div className='form-container'>
        <form onSubmit={handleSubmit(onSubmit)} className="just-form">
            <div className="inputform">
                <div className="label-thing"><label htmlFor="email">Email</label></div>
                <div className="form-group">
                    <AlternateEmailIcon/>
                    <input id="email" type='email' {...register('email', {required: "Email is required"})}
                    placeholder="Enter your email"/>
                </div>
            </div>
            <div className="inputform">
                <div className="label-thing"><label htmlFor='password'>Password</label></div>
                <div className="form-group">
                    <LockOpenIcon/>
                    <input id= 'password' type="text" {...register('password', {required: 'Password is required'})}
                    placeholder="Enter your password"/>
                </div>
            </div>
            <div className="avarage-settings">
                <div className="radio-input">
                    <input type="radio" />
                    <label>Remember me?</label>
                </div>
                <div>
                    <Link to={''}>
                    <span>Forgot password?</span>
                    </Link>
                </div>
            </div>
            <div className="buttons">
                <button type="submit" className="sign-in" disabled={!isValid || isSubmitting}>Sign In</button>
                <button type="button" className="google">
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="google icon" width={'20px'} height={'20px'}/>
                    <p>Sign In with Google</p>
                </button>
            </div>
            <p className="signup">Don't have an account? <Link to={'/auth/register'}>Sign Un</Link></p>
        </form>
    </div>
    </>
    )
}