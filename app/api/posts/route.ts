import { type NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category')
    const sort = searchParams.get('sort') || 'desc'

    let whereCondition = category 
    ? {
        category: {
            is: {
                name: category
            } // เข้าไปใน Table category ที่เชื่อมอยู่กับ posts ค้นหา colum ชื่อ name ใน category
        },
        title: {
            contains: search,
            mode: 'insensitive'
        },
    } :{
        title: {
            contains: search,
            mode: 'insensitive'
        },
    }

    const post = await prisma.post.findMany({
        where: whereCondition as any,
        orderBy: {
            createdAt: sort,
        } as any,
        include: {
            category: true
        }
    })
    return Response.json(post)
}

export async function POST(request: Request) {
    try {
        const { title , content, categoryId } = await request.json()
        const newPost = await prisma.post.create({
            data: {
                title,
                content,
                categoryId: Number(categoryId),
            }
        })
        return Response.json(newPost)
    } catch (error) {
        return new Response(error as BodyInit, {
            status: 500,
        })
    }
}
