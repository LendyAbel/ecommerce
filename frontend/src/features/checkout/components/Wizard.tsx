import { useState } from 'react';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import CheckoutStepperLine from './CheckoutStepperLine';
import { Button } from '@/shared/ui';

const Wizard = () => {
    const [steps, setSteps] = useState(1);

    const nextStep = () => {
        if (steps === 3) {
            // Aquí puedes manejar la acción de finalizar el proceso de pago
            console.log('Pagar');
            return;
        }
        setSteps(prev => prev + 1);
    };
    const prevStep = () => {
        setSteps(prev => prev - 1);
    };

    return (
        <div>
            <CheckoutStepperLine step={steps} />
            <div className='mb-4 flex justify-between mt-1'>
                <Button onClick={prevStep} disabled={steps === 1}>
                    Anterior
                </Button>
                <Button onClick={nextStep}>
                    {steps === 3 ? 'Finalizar' : 'Siguiente'}
                </Button>
            </div>
            <div>
                {steps === 1 && <Step1 />}
                {steps === 2 && <Step2 />}
                {steps === 3 && <Step3 />}
            </div>
        </div>
    );
};

export default Wizard;
