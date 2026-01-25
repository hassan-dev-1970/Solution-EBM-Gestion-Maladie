import SignatureCanvas from "react-signature-canvas";
import { useRef } from "react";

const SignaturePad = ({ onChange }) => {
  const sigRef = useRef();

  const clear = () => {
    sigRef.current.clear();
    onChange(null);
  };

  const save = () => {
    if (!sigRef.current.isEmpty()) {
      onChange(sigRef.current.toDataURL("image/png"));
    }
  };

  return (
    <div>
      <SignatureCanvas
        ref={sigRef}
        penColor="black"
        canvasProps={{
          width: 350,
          height: 120,
          className: "signature-canvas"
        }}
        onEnd={save}
      />

      <div className="signature-actions">
        <button type="button" onClick={clear}>Effacer</button>
      </div>
    </div>
  );
};

export default SignaturePad;
