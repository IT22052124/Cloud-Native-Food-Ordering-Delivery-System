import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Toast() {
  return <ToastContainer position="top-right" autoClose={3000} />;
}
export default Toast;