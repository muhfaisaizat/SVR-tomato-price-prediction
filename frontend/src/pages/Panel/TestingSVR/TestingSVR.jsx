import React, {useState} from 'react'
import Data from './Data'
import InputKernel from './InputKernel'
import Proses from './Proses'

const TestingSVR = () => {
    const [showProses, setShowProses] = useState(false);
    const [dataHarga, setdataHarga] = useState([]);
    const [result, setResult] = useState(null);
  return (
    <div className=" mx-auto  sm:px-6 md:px-8 ">
      <div className="grid-cols-1 lg:grid-cols-2 ">
        <div className="w-full py-3">
          <Data dataHarga={dataHarga} setdataHarga={setdataHarga}/>
        </div>
        <div className="w-full py-3">
          <InputKernel setShowProses={setShowProses} dataHarga={dataHarga} result={result} setResult={setResult} />
        </div>
        {showProses && (
          <div className="w-full py-3">
            <Proses result={result}/>
          </div>
        )}
      </div>
    </div>
  )
}

export default TestingSVR
