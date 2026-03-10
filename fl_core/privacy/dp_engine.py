from opacus import PrivacyEngine

def apply_dp(model, optimizer, dataloader):

    privacy_engine = PrivacyEngine()

    model, optimizer, dataloader = privacy_engine.make_private(
        module=model,
        optimizer=optimizer,
        data_loader=dataloader,
        noise_multiplier=1.0,
        max_grad_norm=1.0,
    )

    return model, optimizer, dataloader