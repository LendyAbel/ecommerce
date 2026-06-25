import { Link } from 'react-router';

interface BackLinkProps {
    backLink: string;
    backPageName: string;
}

const BackLink = ({ backLink, backPageName }: BackLinkProps) => (
    <Link
        to={backLink}
        className='text-text-60 hover:text-primary mb-5 inline-flex items-center gap-1.5 text-sm font-medium transition-colors'
    >
        <svg
            className='size-4'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            aria-hidden='true'
        >
            <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15 19l-7-7 7-7'
            />
        </svg>
        Volver a {`${backPageName}`}
    </Link>
);
export default BackLink;
