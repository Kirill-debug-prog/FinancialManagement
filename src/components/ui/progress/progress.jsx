import * as ProgressPrimitive from '@radix-ui/react-progress'
import './progress.css'

function Progress({ className, value, ...props }) {
    return (
        <ProgressPrimitive.Root
            className={`progress-root ${className}`}
            {...props}
        >
            <ProgressPrimitive.Indicator
                className={`progress-indicator ${className}`}
                style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
            />
        </ProgressPrimitive.Root>
    )
}

export {Progress}