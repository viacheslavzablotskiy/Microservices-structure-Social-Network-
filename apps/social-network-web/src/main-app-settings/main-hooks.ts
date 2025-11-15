import {useSelector, useDispatch} from 'react-redux'
import type { AppDispatch, RootStateStore } from './store'

export const useAppSeletctor = useSelector.withTypes<RootStateStore>();

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();