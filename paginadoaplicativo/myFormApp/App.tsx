import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, TextStyle } from 'react-native';
import CheckBox from 'expo-checkbox';
import { useForm, Controller } from 'react-hook-form';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

interface FormData {
  nome: string;
  email: string;
  endereco: string;
  dataNascimento: string;
  telefone: string;
  aceitaTermos: boolean;
}

const schema = Yup.object().shape({
  nome: Yup.string().required('Nome é obrigatório'),
  email: Yup.string().email('Email inválido').required('Email é obrigatório'),
  endereco: Yup.string().required('Endereço é obrigatório'),
  dataNascimento: Yup.string().required('Data de nascimento é obrigatória'),
  telefone: Yup.string().required('Telefone é obrigatório'),
  aceitaTermos: Yup.boolean().oneOf([true], 'Você deve aceitar os termos'),
});

const App = () => {
  const [gerandoPdf, setGerandoPdf] = useState(false);

  const { control, handleSubmit, formState: { errors }, setValue } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      nome: '',
      email: '',
      endereco: '',
      dataNascimento: '',
      telefone: '',
      aceitaTermos: false,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const [dia, mes, ano] = data.dataNascimento.split('/').map(Number);
      const dataNascimento = new Date(ano, mes - 1, dia);

      const idade = new Date().getFullYear() - dataNascimento.getFullYear();
      
      const htmlContent = `
        <html>
          <body>
            <h1>Declaração</h1>
            <p>Eu me chamo ${data.nome},</p>
            <p>tenho ${idade} anos.</p>
            <p>Moro no seguinte endereço: ${data.endereco}.</p>
            <p>Meus contatos:</p>
            <ul>
              <li>E-mail: ${data.email}</li>
              <li>Telefone: ${data.telefone}</li>
            </ul>
          </body>
        </html>
      `;
      
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.boxperfil}><Text style={styles.textperfil}>Perfil</Text></View>
      <Text style={styles.title}>Dados do participante</Text>
      
      <Text>Nome</Text>
      <Controller
        control={control}
        name="nome"
        render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} onChangeText={onChange} value={value} 
          placeholder="Digite seu nome"/>
        )}
      />
      {errors.nome && <Text style={styles.error}>{errors.nome.message}</Text>}

      <Text>Email</Text>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} onChangeText={onChange} value={value} keyboardType="email-address" 
          placeholder="exemplo@exemplo.com"/>
        )}
      />
      {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

      <Text>Endereço</Text>
      <Controller
        control={control}
        name="endereco"
        render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} onChangeText={onChange} value={value} 
          placeholder="Rua Exemplo, 123 - Bairro Exemplo"/>
        )}
      />
      {errors.endereco && <Text style={styles.error}>{errors.endereco.message}</Text>}

      <Text>Data de Nascimento</Text>
      <Controller
        control={control}
        name="dataNascimento"
        render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} onChangeText={onChange} value={value} placeholder="dd/mm/yyyy" />
        )}
      />
      {errors.dataNascimento && <Text style={styles.error}>{errors.dataNascimento.message}</Text>}

      <Text>Telefone</Text>
      <Controller
        control={control}
        name="telefone"
        render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} onChangeText={onChange} value={value} keyboardType="phone-pad"
          placeholder="(11) 99999-9999"/>
        )}
      />
      {errors.telefone && <Text style={styles.error}>{errors.telefone.message}</Text>}

      <Controller
        control={control}
        name="aceitaTermos"
        render={({ field: { onChange, value } }) => (
          <View style={styles.checkboxContainer}>
            <CheckBox 
              value={value} 
              onValueChange={(val) => {
                onChange(val);
                setValue("aceitaTermos", val);
              }} 
            />
            <Text>Aceito os termos</Text>
          </View>
        )}
      />
      {errors.aceitaTermos && <Text style={styles.error}>{errors.aceitaTermos.message}</Text>}

      <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
        <Text style={styles.buttonText}>Gerar PDF</Text>
      </TouchableOpacity>
      <View><Text style={styles.textimportante}>Importante!</Text></View>
      <View><Text style={styles.textdados}>preencha todos os dados</Text></View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  boxperfil:{
    paddingHorizontal:150,
    padding:25,
    backgroundColor:'#6b5bd4',
  },
  textperfil:{
    color:'white',
    fontSize:20,
    fontWeight: 'bold',
    marginTop:25,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginTop:10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#6b5bd4',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginTop:50,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  textimportante:{
    color:"#6b5bd4",
    paddingHorizontal:50,
    marginTop:30,
  },
  textdados:{
    color:'gray',
    paddingHorizontal:50,
  },
});

export default App;