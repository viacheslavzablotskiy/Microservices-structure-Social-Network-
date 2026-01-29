import type React from "react";


export interface SideBarProps {
    open: boolean,
    setOpen?: React.Dispatch<React.SetStateAction<boolean>>
}

export const SideBar: React.FC<SideBarProps> = ({open}) => {
    return open
} 