# 🚫 ONU NÃO APARECE PARA AUTORIZAR
## 📦 Quando já sei em qual caixa está
### 🧭 Passo a passo:
#### 1️⃣ Identificar a TA OU CTO
**1. Buscar Caixa de Atendimento no sistema**
<!-- ![screenshot_53.png](/mixtel/troubleshooting/fiberhome/onunaolistada/screenshot_53.png) -->
> 📸 Imagem: Buscar caixa de atendimento no sistema

---

**2. Encontrar as informações**
> - OLT:
> - SLOT:
> - PON:

- CTO
<!-- ![screenshot_54.png](/mixtel/troubleshooting/fiberhome/onunaolistada/screenshot_54.png) -->
> 📸 Imagem: Informações da CTO

- OLT
<!-- ![screenshot_57.png](/mixtel/troubleshooting/fiberhome/onunaolistada/screenshot_57.png) -->
> 📸 Imagem: Informações da OLT

- SLOT/PON
<!-- ![screenshot_55.png](/mixtel/troubleshooting/fiberhome/onunaolistada/screenshot_55.png) -->
> 📸 Imagem: Informações SLOT/PON

---

***3. UNM2000***
- Acessar OLT
   - ir no slot
   - ir na pon
   
<!-- ![screenshot_58.png](/mixtel/troubleshooting/fiberhome/onunaolistada/screenshot_58.png) -->
> 📸 Imagem: Acessar OLT no UNM2000

---
- Botão direito em cima da pon
  - vá em Current Alarm

<!-- ![screenshot_59.png](/mixtel/troubleshooting/fiberhome/onunaolistada/screenshot_59.png) -->
> 📸 Imagem: Menu Current Alarm

---
- Procure por Name
  - **PHYSIC_ID_CONFLICT**
  
<!-- ![screenshot_60.png](/mixtel/troubleshooting/fiberhome/onunaolistada/screenshot_60.png) -->
> 📸 Imagem: Procurar PHYSIC_ID_CONFLICT

---
- Va na coluna 
  - **Additional information**

<!-- ![screenshot_61.png](/mixtel/troubleshooting/fiberhome/onunaolistada/screenshot_61.png) -->
> 📸 Imagem: Coluna Additional Information

> - Dentro dessa cell vai esta o mac da onu
>    - **ONU Physic Address**

<!-- ![screenshot_62.png](/mixtel/troubleshooting/fiberhome/onunaolistada/screenshot_62.png) -->
> 📸 Imagem: ONU Physic Address

---







