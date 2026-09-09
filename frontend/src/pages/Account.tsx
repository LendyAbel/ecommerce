import DeleteAccountCard from '@/features/auth/components/DeleteAccountCard';
import PasswordForm from '@/features/auth/components/PasswordForm';
import ProfileForm from '@/features/auth/components/ProfileForm';
import { PageContainer } from '@/shared/components';
import PageHeader from '@/shared/components/PageHeader';

const Account = () => {
    return (
        <PageContainer maxWidth='3xl'>
            <title>Mis Datos · Voltora</title>
            <PageHeader
                title='Mis datos'
                subtitle='Gestiona la información y la seguridad de tu cuenta.'
            />
            <div className='flex flex-col gap-6'>
                <ProfileForm />
                <PasswordForm />
                <DeleteAccountCard />
            </div>
        </PageContainer>
    );
};

export default Account;
