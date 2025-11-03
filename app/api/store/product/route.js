import imageKit from "@/configs/imageKit";
import prisma from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// add new product
export async function POST(request) {
    try {
        const {userId} = getAuth(request)
        const storeId = await authSeller(userId);
        if(!storeId){
            return NextResponse.json({error: "unauthorized"}, {status: 401})
        }
        // get the data from the form
        const formData = await request.formData()
        const name = formData.get("name");
        const description = formData.get("description");
        const mrp = Number(formData.get("mrp"));
        const price = Number(formData.get("price"));
        const category = formData.get("category");
        const images = formData.getAll("images"); // multiple images

        if(!name || !description || !mrp || !price || !category || images.length === 0){
            return NextResponse.json({error: "missing product information"}, {status: 400})
        }

        // check if store exists
        const store = await prisma.store.findFirst({
            where: {id: storeId, userId: userId}
        })

        if(!store){
            return NextResponse.json({error: "store not found"}, {status: 404})
        }

        // upload images to image kit
        const imageUrls = await Promise.all(images.map(async (image) => {
            const buffer = Buffer.from(await image.arrayBuffer());
            const response = await imageKit.upload({
                file: buffer,
                fileName: image.name,
                folder: "products"
            })

            return imageKit.url({
                path: response.filePath,
                transformation: [
                    {quality: "auto" },
                    {format: "webp"},
                    {width: "1024"}
                ]
            })
        }))

        const newProduct = await prisma.product.create({
            data: {
                name: name,
                description: description,
                mrp: mrp,
                price: price,
                category: category,
                images: {
                    create: imageUrls.map(url => ({url}))
                },
                store: {
                    connect: {id: storeId}
                }
            }
        })

        return NextResponse.json({status: "success", product: newProduct})
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: "internal server error"}, {status: 500})
    }
}