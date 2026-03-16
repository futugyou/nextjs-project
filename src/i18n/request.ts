import { getRequestConfig } from 'next-intl/server'
import { cookies, headers } from 'next/headers'

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const headerList = await headers()

  const locale =
    cookieStore.get('NEXT_LOCALE')?.value ||
    headerList.get('accept-language')?.split(',')[0].split('-')[0] ||
    'zh'

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
