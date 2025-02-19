'use server'

import {Session, createServerActionClient} from '@supabase/auth-helpers-nextjs'
import {ChatOpenAI} from 'langchain/chat_models/openai'
import {JsonOutputFunctionsParser} from 'langchain/output_parsers'
import {
	ChatPromptTemplate,
	HumanMessagePromptTemplate,
	SystemMessagePromptTemplate
} from 'langchain/prompts'
import {cookies} from 'next/headers'
import {zodToJsonSchema} from 'zod-to-json-schema'
import env from '~/env.mjs'
import {Stats} from '~/types/github'
import {Manifest, videoSchema} from '~/types/video'
import {findLongestStreak} from './records'

// Generate video scenes using story
export default async function generateScenes(stats: Stats, session: Session) {
	const supabase = createServerActionClient({cookies})
	// Init LLM
	const llm = new ChatOpenAI({
		modelName: 'gpt-4-1106-preview',
		openAIApiKey: env.OPENAI_API_KEY,
		temperature: 0
	})

	// Bind function calling to LLM
	const functionCallingModel = llm.bind({
		functions: [
			{
				name: 'renderVideo',
				description: 'Should always be used to properly format output',
				parameters: zodToJsonSchema(videoSchema)
			}
		],
		function_call: {name: 'renderVideo'}
	})

	// Prompt template
	const prompt = new ChatPromptTemplate({
		promptMessages: [
			SystemMessagePromptTemplate.fromTemplate(
				`You are Github Video Maker, an AI tool that is responsible for generating a compelling narative video based on a users year in code. 
				It is very important that this video feels personal, motivated by their real activities and highlights what was special about that users year in code. 
				The goal of this video is to make the end user feel seen, valued and have a nostalgic moment of review. You do not need to touch on everything, rather 
				hone in on and focus on the key elements that made this year special.
				Make sure there is a story arch that builds over time, and that the video has a clear beginning, middle and end.
				When choosing colors, make sure to hone in on a definitive and aesthetically pleasing color palette, chosing complimentary colors that aren't aggressively different.'
				Videos must always have exactly 12 scenes.
				Today's date (UTC) is ${new Date().toLocaleDateString()}.`
			),
			HumanMessagePromptTemplate.fromTemplate(
				'The GitHub stats are as follows: {stats}'
			)
		],
		inputVariables: ['stats']
	})
	const outputParser = new JsonOutputFunctionsParser()

	// Init chain
	const chain = prompt.pipe(functionCallingModel).pipe(outputParser)

	// get first contribution week where there is a day with contributionCount > 0
	const firstContributionWeek = stats.contributionsHistory.find(week =>
		week.contributionDays.some(day => day.contributionCount > 0)
	)

	// From the first contribution week, find the first day where contributionCount > 0
	const firstContributionDay = firstContributionWeek
		? firstContributionWeek.contributionDays.find(
				day => day.contributionCount > 0
			)
		: null

	// Extract the date of the first contribution
	const firstContributionDate = firstContributionDay
		? firstContributionDay.date
		: null

	stats.firstContributionDate = firstContributionDate

	stats.codingStreakInDays = findLongestStreak(stats.contributionsHistory)

	// Strip out contributions history
	if (stats.contributionsHistory) delete stats.contributionsHistory

	// Run chain
	console.log('Creating frames...')
	const scenes = (await chain.invoke({
		stats: JSON.stringify(stats)
	})) as Manifest

	scenes.song = ['Armageddon', 'Extinguisher', 'RewindThat', 'WontBackDown'][
		Math.floor(Math.random() * 4)
	] as Manifest['song']
	scenes.planet = [
		'mars',
		'jupiter',
		'saturn',
		'mercury',
		'neptune',
		'uranus',
		'venus',
		'moon'
	][Math.floor(Math.random() * 8)] as Manifest['planet']

	// Save to database
	const {data, error} = await supabase
		.from('profile')
		.update({video_manifest: scenes})
		.eq('id', session.user.id)
	if (error) console.error(error.message)

	return scenes as Manifest
}
