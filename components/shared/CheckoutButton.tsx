"use client"

import { IEvent } from '@/lib/database/models/event.model'
import { Show, useUser } from '@clerk/nextjs'
import Link from 'next/link'
import React from 'react'
import { Button } from '../ui/button'
import Checkout from './Checkout'

const CheckoutButton = ({ event }: { event: IEvent }) => {
  const { user } = useUser();
  const userId = user?.publicMetadata.userId as string;
  const hasEventFinished = new Date(event.endDateTime) < new Date();

  return (
    <div className="flex items-center gap-3">
      {hasEventFinished ? (
        <p className="p-2 text-red-400">Sorry, tickets are no longer available.</p>
      ): (
        <>
           <Show when="signed-out">
            <Button asChild className="button rounded-full" size="lg">
              <Link href="/sign-in">
                Get Tickets
              </Link>
            </Button>
          </Show>

          <Show when="signed-in">
            <Checkout event={event} userId={userId} />
          </Show>
        </>
      )}
    </div>
  )
}

export default CheckoutButton