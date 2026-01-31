import { useForm, type SubmitHandler } from "react-hook-form"
import { useAppDispatch } from "../../../main-app-settings/some-settings/main-hooks"
import type { CreationPostDataType } from '@repo/user-interfaces'
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import React, { useEffect, useState } from "react";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useUploadImageMutation } from "../../../main-app-settings/endpoints/images.endpoints";
import { postEndpoints, postsAdapter, useCreatePostMutation } from "../../../main-app-settings/endpoints/post.enpoints";


const createNewPost = () => {
    const { register, handleSubmit, formState: { isValid, isSubmitting } } = useForm<Omit<CreationPostDataType, 'imageUrl'> & { imageUrl: string | File }>()
    const dispatch = useAppDispatch()

    const [selectedImage, setSelectedImage] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    const [uploadImage] = useUploadImageMutation()
    const [createNewPost] = useCreatePostMutation()


    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl)
            }
        }
    }, [previewUrl])

    const onSumbit: SubmitHandler<Omit<CreationPostDataType, 'imageUrl'> & { imageUrl: string | File }> = async (data) => {
        if (!selectedImage) throw new Error('you dont add the image')
        data.imageUrl = selectedImage

        if (data.imageUrl instanceof File) {
            const imagKey = await uploadImage(data.imageUrl).unwrap()
            data.imageUrl = imagKey.key
        }

        const createdPost = await createNewPost({
            ...data, imageUrl: data.imageUrl
        }).unwrap()
        dispatch(postEndpoints.util.updateQueryData('getPosts', {}, (draft) => {
            postsAdapter.addOne(draft, createdPost)
        }))
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            setSelectedImage(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    return (
        <form onSubmit={handleSubmit(onSumbit)} className="post-create-form">
            <div className="form-title">
                <div className="label-name"><label htmlFor="title">Title</label></div>
                <div className="field-title">
                    <DriveFileRenameOutlineIcon color="secondary" fontSize="medium" />
                    <input id="title" type="text" {...register('title', { required: 'title is requeired', minLength: 5 })} placeholder="Write the title of the post" />
                </div>
            </div>
            <div className="form-image">
                <div className="label-name"><label htmlFor="image">Image</label></div>
                <div className="image-field">
                    <input id="image" type="file" {...register('imageUrl', { required: true })} accept="image/*" onChange={handleFileChange} />
                    <div className="preview-wrapper">
                        {previewUrl ? (
                            <>
                                <img src={previewUrl} alt="preview" className="preview-field" />
                                <div className="button-field">
                                    <DeleteOutlineIcon color="secondary" fontSize="medium" />
                                    <button type="button" onClick={() => {
                                        URL.revokeObjectURL(previewUrl)
                                        setSelectedImage(null)
                                        setPreviewUrl(null)
                                    }}>Remove</button>
                                </div>
                            </>) :
                            <span>Uplaod the image</span>
                        }
                    </div>
                </div>
            </div>
            <div className="form-content">
                <div className="label-name"><label htmlFor="content">Content</label></div>
                <div className="contet-field">
                    <DescriptionOutlinedIcon color="secondary" fontSize="medium" />
                    <input type="text" id="content" {...register('content', { required: false })} placeholder="content" />
                </div>
            </div>
            <div className="form-button">
                <button className="sumbit-button" disabled={!isValid || isSubmitting}>Create new Post</button>
            </div>
        </form>
    )
}

export default createNewPost