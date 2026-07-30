interface PageHeaderProps {
    title: string;
    subtitle?: string;
}

const PageHeader = ({ title, subtitle }: PageHeaderProps) => {
    return (
        <header className='mb-6'>
            <h1 className='text-text font-display text-2xl font-extrabold'>
                {title}
            </h1>
            {subtitle && <p className='text-text-60 text-sm'>{subtitle}</p>}
        </header>
    );
};

export default PageHeader;
