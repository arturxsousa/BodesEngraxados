package com.bodesgarage.veiculo;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VeiculoService {

    private final VeiculoRepository repository;

    public List<Veiculo> listarTodos() {
        return repository.findAll();
    }

    public Veiculo buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new VeiculoNotFoundException(id));
    }

    public Veiculo criar(Veiculo veiculo) {
        if (repository.existsByPlaca(veiculo.getPlaca())) {
            throw new PlacaJaCadastradaException(veiculo.getPlaca());
        }
        return repository.save(veiculo);
    }

    public Veiculo atualizar(Long id, Veiculo dados) {
        Veiculo existente = buscarPorId(id);

        if (!existente.getPlaca().equals(dados.getPlaca())
                && repository.existsByPlaca(dados.getPlaca())) {
            throw new PlacaJaCadastradaException(dados.getPlaca());
        }

        existente.setPlaca(dados.getPlaca());
        existente.setAno(dados.getAno());
        existente.setModelo(dados.getModelo());
        existente.setVersao(dados.getVersao());
        existente.setDono(dados.getDono());
        return repository.save(existente);
    }

    public void deletar(Long id) {
        if (!repository.existsById(id)) {
            throw new VeiculoNotFoundException(id);
        }
        repository.deleteById(id);
    }

    // ── Exceções internas ────────────────────────────────────────────────────

    static class VeiculoNotFoundException extends RuntimeException {
        VeiculoNotFoundException(Long id) {
            super("Veículo não encontrado: id=" + id);
        }
    }

    static class PlacaJaCadastradaException extends RuntimeException {
        PlacaJaCadastradaException(String placa) {
            super("Placa já cadastrada: " + placa);
        }
    }
}
