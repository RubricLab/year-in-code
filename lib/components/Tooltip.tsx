import {ReactNode} from 'react'

export default function Tooltip({
	children,
	body
}: {
	children: ReactNode
	body: string
}) {
	return (
		<div className='group relative flex justify-center'>
			{children}
			<span className='absolute bottom-[120%] w-32 scale-0 rounded-md border-2 border-black bg-white/80 px-2 py-1 text-center text-black transition-all delay-200 group-hover:scale-100'>
				{body}
			</span>
		</div>
	)
}
