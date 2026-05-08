package com.bodesgarage.veiculo;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "veiculos")
@Getter @Setter @NoArgsConstructor
public class Veiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, unique = true, length = 8)
    private String placa;

    @NotBlank
    @Column(nullable = false, length = 4)
    private String ano;

    @NotBlank
    @Column(nullable = false)
    private String modelo;

    @Column
    private String versao;

    // Será substituído por @ManyToOne Dono quando a entidade Dono for criada
    @Column
    private String dono;
}
