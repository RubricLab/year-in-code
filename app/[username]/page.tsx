import {
	Session,
	createServerComponentClient
} from '@supabase/auth-helpers-nextjs'
import {cookies} from 'next/headers'
import {redirect} from 'next/navigation'
import {Suspense} from 'react'
import Loading from '~/components/Loading'
import Player from '~/components/Player'
import Toolbar from '~/components/Toolbar'
import {Stats} from '~/types/github'
import {Profile} from '~/types/profile'
import {Database} from '~/types/supabase'
import {Manifest} from '~/types/video'
import generateScenes from '~/utils/generate'
import {default as getProfile} from '~/utils/profile'
import {getStats} from '~/utils/stats'

async function Video({
	session,
	profile,
	stats
}: {
	session: Session
	profile: Profile
	stats: Stats
}) {
	// Generate scenes
	const scenes =
		!profile || profile.video_manifest === null
			? await generateScenes(stats, session)
			: (profile.video_manifest as Manifest)
	return (
		<div className='flex flex-col items-center'>
			<Player video={scenes} />
			<Toolbar session={session} />
		</div>
	)
}

export default async function Profile({params}: {params: {username: string}}) {
	const supabase = createServerComponentClient<Database>({cookies})
	const {
		data: {session}
	} = await supabase.auth.getSession()

	if (!session) redirect('/')

	// GitHub provider_token is null if a user revisits the page after the token has expired
	// Supabase does not plan on adding support for this anytime soon
	// Improvement: https://github.com/supabase/gotrue-js/issues/806 manually make request to GitHub
	// API and reset the provider token
	if (session.provider_token === null) {
		await supabase.auth.signOut()
		redirect('/')
	}

	const profile = await getProfile(session)
	const stats = profile
		? (profile.github_stats as unknown as Stats)
		: await getStats(session.provider_token)

	return (
		<div className='flex min-h-screen flex-col items-center justify-center gap-5'>
			<Suspense fallback={<Loading stats={stats} />}>
				<Video
					profile={profile}
					stats={stats}
					session={session}
				/>
			</Suspense>
		</div>
	)
}
