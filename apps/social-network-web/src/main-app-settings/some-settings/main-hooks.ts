import {useSelector, useDispatch} from 'react-redux'
import { type AppDispatch, type RootStateStore } from '../store-settings/store';

export const useAppSeletctor = useSelector.withTypes<RootStateStore>();

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();