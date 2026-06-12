import React from 'react';

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export default function FormLabel({ required, children, ...props }: FormLabelProps) {
  return (
    <label {...props} className={`block text-sm font-semibold text-slate-700 mb-2 ${props.className ?? ""}`}>
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}
