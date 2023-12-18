export interface Stats {
	username: string
	email?: string
	fullName?: string
	avatarUrl?: string
	year: number
	company?: string
	commits?: number
	pulls?: number
	contributions?: number
	contributionsHistory?: Week[]
	linkPreviewURL?: string
	repos?: number
	reviews?: number
	stars?: Star
	topRepos?: Repo[]
	topLanguages?: Language[]
	topFollows?: Follows
	firstContributionDate?: string
	codingStreakInDays?: number
}
export interface Repo {
	name: string
	owner?: string
	avatarUrl?: string
	isPrivate?: boolean
	nameWithOwner?: string
	url?: string
	stars?: number
	topLanguages?: Language[]
	contributions?: Number
}
export interface Language {
	name: string
	commonName: string
	color?: string
}
export interface Follows {
	following: {totalCount: Number; latest: Actor[]}
	followers: {totalCount: Number; latest: Actor[]}
}
export interface Actor {
	avatarUrl: string
	name: string
	login: string
	url: string
}

export interface Star {
	given: Number
	received: Number
}

export interface contributionDays {
	color: string
	contributionCount: any
	date: string
	weekday: Number
}

export interface Week {
	contributionDays: contributionDays[]
	firstDay: string
}
