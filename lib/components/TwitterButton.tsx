'use client'

import {track} from '@vercel/analytics'
import Link from 'next/link'
import {META} from '~/constants/metadata'
import {Profile} from '~/types/profile'
import Tooltip from './Tooltip'
import {IconTwitter} from './icons/Twitter'

export default function TwitterButton({
	isOwn,
	profile
}: {
	isOwn: boolean
	profile: Profile
}) {
	const text = `Check out ${
		isOwn ? 'my' : `${profile.user_name}'s`
	} 2024 year in code! Get yours now.`
	const hashtags = 'YearInCode2024'
	const url = META.domain.prod + profile.user_name
	return (
		<Tooltip body='X (Twitter)'>
			<Link
				href={`https://twitter.com/intent/tweet?text=${text}&hashtags=${hashtags}&url=${url}`}
				target='_blank'>
				<button
					className='group rounded-md p-2'
					onClick={() => track('Share: Twitter')}>
					<IconTwitter className='h-5 w-5 transition-transform duration-300 group-hover:-rotate-12' />
				</button>
			</Link>
		</Tooltip>
	)
}
