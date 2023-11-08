import { geolocation, ipAddress } from '@vercel/edge'
export const runtime = 'edge'



export function GET(request: Request) {
    const { city, country, latitude, longitude, region } = geolocation(request)
    // You can also get the city using dot notation on the function
    // const city = geolocation(request).city
    const ip = ipAddress(request) || 'unknown'

    return new Response(
        `
            <h1>Your location is ${city}</h1>
            <h1>Your country is ${country}</h1>
            <h1>Your latitude is ${latitude}</h1>
            <h1>Your longitude is ${longitude}</h1>
            <h1>Your region is ${region}</h1>
            <h1>Your IP is ${ip}</h1> 
        `,
        {
            headers: { 'content-type': 'text/html' },
        })
}