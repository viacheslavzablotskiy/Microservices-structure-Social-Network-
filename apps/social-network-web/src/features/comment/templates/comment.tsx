import { type ReturnCommentTypeData } from "@repo/user-interfaces"
import React, { useCallback, useRef, useState } from "react"
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useAppDispatch, useAppSeletctor } from "../../../main-app-settings/some-settings/main-hooks";
import { commentEndpoints, commnetSelectors, useDeleteCommentMutation, useUpdateCommentMutation } from "../../../main-app-settings/endpoints/comment.endpoints";


export const Comment: React.FC<{ comment: ReturnCommentTypeData, postId: number }> = React.memo(({ comment, postId }) => {
    const currentUser = useAppSeletctor(state => state.auth.currentAuthUser)
    const [isEditing, setIsEditing] = useState<boolean>(false)
    const dispatch = useAppDispatch()
    const inputRef = useRef<HTMLInputElement>(null)
    const [updateComment] = useUpdateCommentMutation()
    const [deleteComment] = useDeleteCommentMutation()

    const handleSave = async () => {
        if (inputRef.current && inputRef.current?.value !== comment.content) {
            const updatedComment = await updateComment({commentId: String(comment.id), data: {content: inputRef.current?.value}}).unwrap()
            dispatch(commentEndpoints.util.updateQueryData('getComments', {postId: String(postId)}, (draft) => {
                    const currentComment = commnetSelectors.selectById(draft, comment.id)
                    currentComment.content = updatedComment.content
            }))
        } 
        setIsEditing(false)
    }

    const handleupdatedClick = useCallback(() => {
        setIsEditing(true)
    }, [])

    const handleBack = () => {
        setIsEditing(false)
    }

    const handleDeleteClick = useCallback(async () => {
        await deleteComment({commentId: String(comment.id)})

    }, [comment.id, deleteComment])

    return <>
        <div className="comment-information">
            <div className="comment-login">
                <p>{comment.userData.login}</p>
            </div>
            <div className="comment-content">
                {isEditing ? 
                (<input defaultValue={comment.content} ref={inputRef}/>) :
                (<p>{comment.content}</p>)}
            </div>
        </div>
        <div className="comment-image">
            <img src={comment.userData.avatarUrl} alt="avatar of the user" />
        </div>
        {(currentUser?.id === comment.userId || !isEditing) && <SettingsComment handleUpdateClick={handleupdatedClick} handleDeleteClick={handleDeleteClick}/>}
        {isEditing && <EditingSettingsData onSave={handleSave} onBack={handleBack}/>}
    </>
})

export type SettingsCommentsProp = {
    handleUpdateClick: () => void,
    handleDeleteClick: () => void
}

export const SettingsComment: React.FC<SettingsCommentsProp> = React.memo(({handleDeleteClick, handleUpdateClick}) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const open = Boolean(anchorEl)

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(e.currentTarget)
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    return <>
        <Button id='basic-button'
            aria-controls={open ? 'basic-menu' : undefined}
            aria-haspopup='true'
            aria-expanded={open ? 'true' : undefined}
            variant="text"
            onClick={handleClick}
            className="comment-settings-button">
            <MoreVertIcon color="secondary" fontSize="medium" />
        </Button>
        <Menu id='basic-menu'
            className="comment-settings-menu"
            open={open} anchorEl={anchorEl}
            onClose={handleClose}
            slotProps={{
                list: {
                    'aria-labelledby': 'basic-button'
                }
            }}>
            <MenuItem onClick={() => {
                handleClose()
                handleUpdateClick()
            }}>Update</MenuItem>
            <MenuItem onClick={() => {
                handleClose()
                handleDeleteClick()
            }}>Delete</MenuItem>
        </Menu>
    </>
})


export type EdititngSettingsProps = {
    onSave: () => void,
    onBack: () => void
}



export const EditingSettingsData: React.FC<EdititngSettingsProps> = ({onBack, onSave}) => {
    return <div className="comment-edit-buttons">
        <button className="comment-back-button" onClick={onBack}>Back</button>
        <button className="comment-save-button" onClick={onSave}>Save</button>
    </div>
}