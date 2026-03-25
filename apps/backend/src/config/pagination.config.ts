import { registerAs } from '@nestjs/config'

export default registerAs('pagination', () => ({
  pageSize: process.env.PAGE_SIZE,
}))
