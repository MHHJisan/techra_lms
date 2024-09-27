"use client"

import * as z from "zod"

 interface TitleFormProps {
    initialData: {
        title: string;
    };
    courseId: String;
 }

 export const TitleFrom  = (
    {
        initialData,
        courseId
    }: TitleFormProps
 ) => {
    return ( 
        <div>
            Title Form
        </div>
     );
 }
  
 