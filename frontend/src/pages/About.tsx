import { NavLink } from 'react-router';
import MemoryIcon from '@mui/icons-material/Memory';
import VerifiedIcon from '@mui/icons-material/Verified';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import BoltIcon from '@mui/icons-material/Bolt';
import RecyclingIcon from '@mui/icons-material/Recycling';

const STATS = [
    { value: '+11', label: 'años en el sector' },
    { value: '+25.000', label: 'referencias en stock' },
    { value: '+180k', label: 'pedidos enviados' },
    { value: '24/48h', label: 'entrega en península' },
] as const;

const VALUES = [
    {
        icon: VerifiedIcon,
        title: 'Componentes certificados',
        text: 'Trabajamos solo con distribuidores oficiales. Cada microcontrolador, sensor o módulo llega con su datasheet y trazabilidad de lote.',
    },
    {
        icon: SupportAgentIcon,
        title: 'Asesoría de ingeniería',
        text: 'Nuestro equipo técnico te ayuda a elegir el chip o la placa correcta. Soporte real de personas que también sueldan y programan.',
    },
    {
        icon: LocalShippingIcon,
        title: 'Envío exprés',
        text: 'Preparamos los pedidos el mismo día antes de las 17:00. Embalaje antiestático para que nada llegue dañado por ESD.',
    },
    {
        icon: BoltIcon,
        title: 'Prototipa sin frenos',
        text: 'Desde una resistencia suelta hasta 500 unidades para producción. Sin pedidos mínimos para makers y estudiantes.',
    },
    {
        icon: MemoryIcon,
        title: 'Catálogo siempre vivo',
        text: 'Incorporamos las últimas SBC, FPGAs y módulos inalámbricos en cuanto salen al mercado. Tu próximo proyecto empieza aquí.',
    },
    {
        icon: RecyclingIcon,
        title: 'Electrónica responsable',
        text: 'Reciclamos componentes y embalajes, y priorizamos proveedores con etiquetado RoHS. La tecnología no debería costarle al planeta.',
    },
] as const;

const MILESTONES = [
    {
        year: '2014',
        title: 'Nace en un garaje',
        text: 'Dos ingenieros cansados de esperar semanas por una placa Arduino abren una pequeña tienda online.',
    },
    {
        year: '2017',
        title: 'Primer almacén propio',
        text: 'Abrimos 600 m² en Getafe y superamos las 8.000 referencias en stock permanente.',
    },
    {
        year: '2020',
        title: 'Laboratorio de soporte',
        text: 'Montamos un banco de pruebas para validar módulos y publicar guías técnicas gratuitas.',
    },
    {
        year: '2025',
        title: 'Referencia para makers',
        text: 'Más de 180.000 pedidos servidos a hobbistas, universidades y fabricantes de toda Europa.',
    },
] as const;

const TEAM = [
    { name: 'Lucía Marén', role: 'Cofundadora · CEO', initials: 'LM', accent: 'var(--color-primary)' },
    { name: 'Diego Ferrán', role: 'Cofundador · CTO', initials: 'DF', accent: 'var(--color-secondary)' },
    { name: 'Aisha Benali', role: 'Lead de soporte técnico', initials: 'AB', accent: 'var(--color-accent)' },
    { name: 'Marc Oller', role: 'Compras y proveedores', initials: 'MO', accent: 'var(--color-highlight-new)' },
] as const;

const About = () => {
    return (
        <div className='bg-bg'>
            {/* ── Hero ── */}
            <section className='relative flex min-h-105 flex-col items-center justify-center overflow-hidden px-6 py-20 text-center'>
                <div
                    aria-hidden='true'
                    className='pointer-events-none absolute inset-0'
                    style={{
                        background:
                            'radial-gradient(ellipse 80% 60% at 50% 0%, var(--color-primary-10) 0%, transparent 70%)',
                    }}
                />

                <p className='animate-slide-up text-primary relative mb-2 text-xs font-semibold tracking-[0.3em] uppercase'>
                    Sobre Voltora
                </p>
                <h1 className='animate-slide-up delay-100 text-text font-display relative max-w-3xl text-4xl leading-tight font-bold md:text-5xl'>
                    Componentes que dan vida a tus ideas
                </h1>
                <p className='animate-slide-up delay-200 text-text-60 relative mt-4 max-w-xl text-base'>
                    Somos una tienda de componentes electrónicos y tecnología nacida entre
                    protoboards y soldadores. Abastecemos a makers, estudiantes y empresas con
                    piezas de confianza y soporte de quienes saben de lo que hablan.
                </p>

                <div className='animate-slide-up delay-300 relative mt-8 flex flex-wrap items-center justify-center gap-4'>
                    <NavLink to='/products' className='btn btn-primary btn-lg'>
                        Ver catálogo
                    </NavLink>
                    <a href='#equipo' className='btn btn-outline btn-lg'>
                        Conoce al equipo
                    </a>
                </div>
            </section>

            {/* ── Stats ── */}
            <section className='border-border bg-panel border-y'>
                <div className='mx-auto grid w-[90%] max-w-5xl grid-cols-2 gap-y-8 py-12 md:grid-cols-4'>
                    {STATS.map(stat => (
                        <div key={stat.label} className='text-center'>
                            <p className='text-primary font-display text-3xl font-bold md:text-4xl'>
                                {stat.value}
                            </p>
                            <p className='text-text-60 mt-1 text-xs tracking-widest uppercase'>
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Misión / Historia ── */}
            <section className='mx-auto grid w-[90%] max-w-5xl items-center gap-12 py-16 md:grid-cols-2 md:py-20'>
                <div>
                    <p className='text-primary mb-2 text-xs font-semibold tracking-[0.3em] uppercase'>
                        Nuestra misión
                    </p>
                    <h2 className='text-text font-display text-3xl font-bold'>
                        Hacer accesible la electrónica
                    </h2>
                    <p className='text-text-60 mt-4 leading-relaxed'>
                        Empezamos en 2014 porque conseguir un sensor concreto en España podía tardar
                        semanas. Hoy mantenemos más de 25.000 referencias en stock —desde una
                        resistencia de 10&nbsp;Ω hasta una FPGA de última generación— listas para
                        salir el mismo día.
                    </p>
                    <p className='text-text-60 mt-4 leading-relaxed'>
                        Creemos que un buen proyecto no debería detenerse esperando una pieza. Por
                        eso combinamos un catálogo profundo con asesoría técnica real: si dudas entre
                        un ESP32 y un STM32, hablas con alguien que ha trabajado con ambos.
                    </p>
                </div>

                <div className='border-border bg-surface relative overflow-hidden rounded-2xl border p-8 shadow-sm'>
                    <div
                        aria-hidden='true'
                        className='pointer-events-none absolute inset-0 opacity-60'
                        style={{
                            background:
                                'radial-gradient(circle at 85% 15%, var(--color-secondary-20) 0%, transparent 55%)',
                        }}
                    />
                    <MemoryIcon
                        className='text-primary relative'
                        style={{ fontSize: '2.5rem' }}
                    />
                    <p className='text-text font-display relative mt-4 text-xl font-bold'>
                        «Si lo puedes imaginar, probablemente lo tengamos en stock.»
                    </p>
                    <p className='text-text-60 relative mt-3 text-sm leading-relaxed'>
                        Microcontroladores, sensores, módulos RF, herramientas de soldadura, fuentes
                        de alimentación, impresión 3D y robótica. Todo lo que necesita un banco de
                        trabajo, bajo un mismo techo.
                    </p>
                    <div className='relative mt-5 flex flex-wrap gap-2'>
                        {['Arduino', 'Raspberry Pi', 'ESP32', 'STM32', 'Sensores', 'Robótica'].map(
                            tag => (
                                <span key={tag} className='badge badge-primary'>
                                    {tag}
                                </span>
                            ),
                        )}
                    </div>
                </div>
            </section>

            {/* ── Valores ── */}
            <section className='border-border bg-panel border-t py-16 md:py-20'>
                <div className='mx-auto w-[90%] max-w-5xl'>
                    <div className='mb-10 text-center'>
                        <p className='text-primary mb-2 text-xs font-semibold tracking-[0.3em] uppercase'>
                            Por qué elegirnos
                        </p>
                        <h2 className='text-text font-display text-3xl font-bold'>
                            Más que una tienda de piezas
                        </h2>
                    </div>

                    <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                        {VALUES.map(({ icon: Icon, title, text }) => (
                            <div
                                key={title}
                                className='border-border bg-surface group rounded-2xl border p-6 shadow-sm transition-shadow duration-300 hover:shadow-lg'
                            >
                                <span className='bg-primary-10 text-primary inline-flex h-11 w-11 items-center justify-center rounded-xl'>
                                    <Icon />
                                </span>
                                <h3 className='text-text font-display mt-4 text-lg font-bold'>
                                    {title}
                                </h3>
                                <p className='text-text-60 mt-2 text-sm leading-relaxed'>{text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Hitos / Timeline ── */}
            <section className='mx-auto w-[90%] max-w-3xl py-16 md:py-20'>
                <div className='mb-10 text-center'>
                    <p className='text-primary mb-2 text-xs font-semibold tracking-[0.3em] uppercase'>
                        Nuestra historia
                    </p>
                    <h2 className='text-text font-display text-3xl font-bold'>
                        De un garaje a referencia europea
                    </h2>
                </div>

                <ol className='border-border relative ml-3 border-l'>
                    {MILESTONES.map(milestone => (
                        <li key={milestone.year} className='relative pb-10 pl-8 last:pb-0'>
                            <span className='bg-primary border-bg absolute top-1 -left-[7px] h-3.5 w-3.5 rounded-full border-4' />
                            <p className='text-primary font-display text-sm font-bold tracking-widest'>
                                {milestone.year}
                            </p>
                            <h3 className='text-text font-display mt-1 text-lg font-bold'>
                                {milestone.title}
                            </h3>
                            <p className='text-text-60 mt-1 text-sm leading-relaxed'>
                                {milestone.text}
                            </p>
                        </li>
                    ))}
                </ol>
            </section>

            {/* ── Equipo ── */}
            <section id='equipo' className='border-border bg-panel border-t py-16 md:py-20'>
                <div className='mx-auto w-[90%] max-w-5xl'>
                    <div className='mb-10 text-center'>
                        <p className='text-primary mb-2 text-xs font-semibold tracking-[0.3em] uppercase'>
                            El equipo
                        </p>
                        <h2 className='text-text font-display text-3xl font-bold'>
                            Personas que también sueldan
                        </h2>
                    </div>

                    <div className='grid grid-cols-2 gap-6 lg:grid-cols-4'>
                        {TEAM.map(member => (
                            <div
                                key={member.name}
                                className='border-border bg-surface flex flex-col items-center rounded-2xl border p-6 text-center shadow-sm'
                            >
                                <span
                                    className='font-display flex h-16 w-16 items-center justify-center rounded-full text-lg font-bold text-white'
                                    style={{ backgroundColor: member.accent }}
                                >
                                    {member.initials}
                                </span>
                                <h3 className='text-text font-display mt-4 text-base font-bold'>
                                    {member.name}
                                </h3>
                                <p className='text-text-60 mt-1 text-xs tracking-wide'>
                                    {member.role}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA final ── */}
            <section className='border-border bg-surface border-t py-16 text-center'>
                <div className='mx-auto w-[90%] max-w-xl'>
                    <h2 className='text-text font-display text-2xl font-bold'>
                        ¿Listo para tu próximo proyecto?
                    </h2>
                    <p className='text-text-60 mt-3'>
                        Explora nuestro catálogo de componentes y recibe tu pedido en 24/48h.
                    </p>
                    <div className='mt-6'>
                        <NavLink to='/products' className='btn btn-primary btn-lg'>
                            Ver productos
                        </NavLink>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
