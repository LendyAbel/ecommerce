import { StepProgressLine } from '@/shared/ui';

const ORDER_STEPS = [
    'Dirección de envío',
    'Resumen del pedido',
    'Confirmación del pago',
];

interface CheckoutStepperLineProps {
    step: number;
}

const CheckoutStepperLine = ({ step }: CheckoutStepperLineProps) => {
    return <StepProgressLine steps={ORDER_STEPS} currentIndex={step - 1} />;
};

export default CheckoutStepperLine;
