import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign } from 'hono/jwt'
import { signupInput, signinInput } from "@100xdevs/medium-common";

export const userRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    }
}>();

userRouter.post('/signup', async (c) => {
    const body = await c.req.json();
    const { success } = signupInput.safeParse(body);
    if (!success) {
        c.status(400); // Use 400 for bad request/validation errors
        return c.json({
            message: "Inputs not correct"
        })
    }
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    try {
      const user = await prisma.user.create({
        data: {
          username: body.username,
          password: body.password,
          name: body.name
        }
      })
      const jwt = await sign({
        id: user.id
      }, c.env.JWT_SECRET);
 
      return c.json({ jwt }); // Return as JSON object for consistency
    } 
    
    catch(e) {
      console.log(e);
      c.status(500); // Use 500 for internal/database errors
      return c.json({ message: 'Error while signing up' })
    }
})
 
 
userRouter.post('/signin', async (c) => {
    const body = await c.req.json();
    const { success } = signinInput.safeParse(body);
    if (!success) {
        c.status(400); // Use 400 for bad request/validation errors
        return c.json({
            message: "Inputs not correct"
        })
    }

    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
 
    try {
      const user = await prisma.user.findFirst({
        where: {
          username: body.username,
          password: body.password,
        }
      })
      if (!user) {
        c.status(403); // 403 Forbidden is good for auth issues
        return c.json({
          message: "Incorrect credentials"
        })
      }
      const jwt = await sign({
        id: user.id
      }, c.env.JWT_SECRET);
 
      return c.json({ jwt }); // Return as JSON object for consistency
    } catch(e) {
      console.log(e);
      c.status(500); // Use 500 for internal/database errors
      return c.json({ message: 'Error while signing in' })
    }
})
