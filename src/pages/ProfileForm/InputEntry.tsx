import type { ReactNode } from 'react';
import { Element } from 'react-scroll';

interface InputEntryProperties {
  id: string;
  label: string;
  errors: object;
  isDisabled: boolean;
  register: () => void;
  children: ReactNode
}

function InputEntry({id, errors, label, register, isDisabled = false, children}: InputEntryProperties): JSX.Element {
  return (
          <div className="mb-6">
            <Element name={id}>
              <label
                htmlFor={id}
                className="text-[1.125em] font-medium tracking-[inherit] leading-tight mb-2 inline-block w-full"
              >
                {label}
              </label>
              {children}
              <input
                type="text"
                id={id}
                className={`border w-full ${errors[id] ? 'border-errorColor border-2': ""} disabled:bg-disabledColor`}
                {...register(id, {
                  required: true
                })}
                disabled={isDisabled}
              />
              {errors[id] ? <p className="text-base text-errorColor mt-2">
                {errors[id].message}
              </p> : null}
            </Element>
          </div>
  )
}

export default InputEntry;