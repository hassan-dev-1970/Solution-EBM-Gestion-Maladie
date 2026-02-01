import { useRef } from "react";
import SignatureCanvas from "react-signature-canvas";

const SignaturePad = ({ onChange }) => {
  const sigRef = useRef();


  const save = () => {
    if (!sigRef.current.isEmpty()) {
      onChange(sigRef.current.toDataURL("image/png"))
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
          style: { border: "none", backgroundColor: "#f4ecec" },
          className: "signature-canvas"
        }}
        onEnd={save}
      />
      
    </div>
  );
};

export default SignaturePad;
