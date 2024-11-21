import { chain } from "../chain.ts";
import { client } from "../client.ts";
import { ThirdwebProvider, ConnectButton, PayEmbed, ConnectEmbed } from "../thirdweb.ts"; // Assurez-vous que le chemin est correct
import DCAComponent from "./DCAComponent.jsx";
import { SuperBoringDCAForm } from "./SuperBoringDCAForm.jsx";
import { DCAForm } from "./DCAForm.jsx";

const ThirdwebProviderWrapper = () => {

  return (
      <ThirdwebProvider>
        <ConnectButton client:only="react"
         client={client}
         chain={chain} />
        <DCAForm />
      </ThirdwebProvider>
  );
};

export default ThirdwebProviderWrapper;
